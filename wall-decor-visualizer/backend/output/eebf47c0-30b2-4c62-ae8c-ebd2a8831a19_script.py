OUTPUT_PATH = '/tmp/eebf47c0-30b2-4c62-ae8c-ebd2a8831a19.glb'

import bpy

def create_wall_skeleton():
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Wall thickness (assumed 0.5 feet)
    thickness = 0.5

    # Dimensions from image:
    # Total Height = 9'
    # Door Area Width = 7'
    # Door Area Height = 8'
    # Wall above door height = 1' (9' - 8')
    # Right Wall Width = 7'6" = 7.5'
    # Total Width = 7' + 7.5' = 14.5'

    # 1. Create the Right Wall Segment
    # Width: 7.5, Height: 9
    # Position: Starts at X=7, Z=0
    right_wall_width = 7.5
    right_wall_height = 9.0
    
    bpy.ops.mesh.primitive_cube_add(size=1)
    right_wall = bpy.context.active_object
    right_wall.name = "Wall_Right_Segment"
    right_wall.scale = (right_wall_width, thickness, right_wall_height)
    # Location is center of the cube
    right_wall.location = (7.0 + right_wall_width / 2, 0, right_wall_height / 2)

    # 2. Create the Top Wall Segment (above the door)
    # Width: 7.0, Height: 1.0
    # Position: Starts at X=0, Z=8
    top_wall_width = 7.0
    top_wall_height = 1.0
    
    bpy.ops.mesh.primitive_cube_add(size=1)
    top_wall = bpy.context.active_object
    top_wall.name = "Wall_Top_Segment"
    top_wall.scale = (top_wall_width, thickness, top_wall_height)
    # Location is center of the cube
    top_wall.location = (top_wall_width / 2, 0, 8.0 + top_wall_height / 2)

    # Apply scales to all objects
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Export to GLB
    # Note: filepath can be adjusted as needed for the environment
    bpy.ops.export_scene.gltf(
        filepath='/tmp/eebf47c0-30b2-4c62-ae8c-ebd2a8831a19.glb',
        export_format='GLB',
        use_selection=False
    )

# Call the function directly as requested
create_wall_skeleton()