OUTPUT_PATH = '/tmp/a778ad52-fcf6-4738-92ce-24ad15c88a57.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the wall skeleton based on the provided image dimensions.
    Dimensions:
    - Total Wall Height: 9'
    - Total Wall Width: 7' (left section) + 7'6" (right section) = 14'6"
    - Opening (Door/AC) Height: 8'
    - Opening (Door/AC) Width: 7'
    - Opening Position: Bottom-left corner
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor
    ft_to_m = 0.3048
    
    # Wall Dimensions
    wall_width = 14.5 * ft_to_m  # 14'6"
    wall_height = 9.0 * ft_to_m  # 9'
    wall_thickness = 0.15        # Standard ~6 inch wall thickness
    
    # Opening Dimensions
    opening_width = 7.0 * ft_to_m # 7'
    opening_height = 8.0 * ft_to_m # 8'
    
    # 1. Create the Main Wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "MainWall"
    
    # Scale and position (placing bottom-left at origin 0,0,0)
    wall.scale = (wall_width, wall_thickness, wall_height)
    wall.location = (wall_width / 2, wall_thickness / 2, wall_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    # 2. Create the Opening (Cutter)
    bpy.ops.mesh.primitive_cube_add(size=1)
    cutter = bpy.context.active_object
    cutter.name = "Opening_Cutter"
    
    # Scale cutter slightly thicker to ensure clean boolean cut
    cutter.scale = (opening_width, wall_thickness * 2, opening_height)
    # Position at the bottom left
    cutter.location = (opening_width / 2, wall_thickness / 2, opening_height / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    
    # 3. Apply Boolean Difference
    boolean_mod = wall.modifiers.new(name="OpeningCut", type='BOOLEAN')
    boolean_mod.object = cutter
    boolean_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=boolean_mod.name)
    
    # 4. Remove the cutter object
    bpy.data.objects.remove(cutter, do_unlink=True)
    
    # 5. Export to GLB
    # Headless blender usually requires an absolute path or it saves to the current working directory
    export_path = "wall_skeleton.glb"
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format='GLB',
        use_selection=False
    )
    
    print(f"Wall skeleton created and exported to {export_path}")

# Execute the function directly
create_wall_skeleton()