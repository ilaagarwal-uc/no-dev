OUTPUT_PATH = '/tmp/862b6361-a4cf-4fe1-aade-2ce4a2344b79.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the wall skeleton based on the provided image dimensions.
    Dimensions:
    - Total Height: 9'
    - Total Width: 7' (left section) + 7'6" (right section) = 14'6"
    - Opening (Door + AC): 7' wide by 8' high, located at the bottom-left.
    """
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters (Blender default)
    ft_to_m = 0.3048

    # Calculated dimensions
    total_width = 14.5 * ft_to_m
    total_height = 9.0 * ft_to_m
    wall_thickness = 0.15  # Standard wall thickness (~6 inches)

    opening_width = 7.0 * ft_to_m
    opening_height = 8.0 * ft_to_m

    # 1. Create the Main Wall
    # We use a unit cube and scale it to avoid mesh distortion
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "Main_Wall"
    
    # Set dimensions and position
    # Positioned so the bottom-left-front corner is at (0,0,0)
    wall.scale = (total_width, wall_thickness, total_height)
    wall.location = (total_width / 2, wall_thickness / 2, total_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 2. Create the Opening (Cutter for Boolean)
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    
    # Scale cutter to be slightly thicker than the wall for a clean cut
    cutter.scale = (opening_width, wall_thickness * 2, opening_height)
    # Position at the bottom-left corner
    cutter.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # 3. Apply Boolean Operation to create the door/AC opening
    bool_mod = wall.modifiers.new(name="Wall_Opening", type='BOOLEAN')
    bool_mod.object = cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Clean up: Remove the cutter object
    bpy.data.objects.remove(cutter, do_unlink=True)

    # Export the result to GLB format
    # use_selection=False ensures the entire scene (the wall) is exported
    bpy.ops.export_scene.gltf(
        filepath='/tmp/862b6361-a4cf-4fe1-aade-2ce4a2344b79.glb',
        export_format='GLB',
        use_selection=False
    )

# Execute the reconstruction
create_wall_skeleton()